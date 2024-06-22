
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "plv8" WITH SCHEMA "pg_catalog";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."notification_type" AS ENUM (
    'reply',
    'like',
    'follow',
    'repost'
);

ALTER TYPE "public"."notification_type" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_parent_state"() RETURNS "trigger"
    LANGUAGE "plv8"
    AS $_$if (NEW.parent_id) {
  const parent = plv8.execute(
        'select * from public.valid_posts where id = $1',
        [NEW.parent_id]
    );

  if (parent.length === 0) {
    throw new Error('cannot find related post.');
  }
}
return NEW;$_$;

ALTER FUNCTION "public"."check_parent_state"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_post_state"() RETURNS "trigger"
    LANGUAGE "plv8"
    AS $_$const post = plv8.execute(
      'select * from public.valid_posts where id = $1',
      [NEW.post_id]
  );

if (post.length === 0) {
  throw new Error('cannot find related post.');
}

return NEW;$_$;

ALTER FUNCTION "public"."check_post_state"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "owner_id" "uuid",
    "content" "text" NOT NULL,
    "mentions" "text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" bigint NOT NULL,
    "parent_id" bigint DEFAULT '0'::bigint,
    "deleted" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."repost" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" bigint NOT NULL
);

ALTER TABLE "public"."repost" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."valid_posts" WITH ("security_invoker"='on') AS
 SELECT "posts"."owner_id",
    "posts"."content",
    "posts"."mentions",
    "posts"."created_at",
    "posts"."id",
    "posts"."parent_id",
    "posts"."deleted"
   FROM "public"."posts"
  WHERE ("posts"."deleted" = false);

ALTER TABLE "public"."valid_posts" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."user_valid_posts" WITH ("security_invoker"='true') AS
 SELECT 'repost'::"text" AS "type",
    "repost"."created_at" AS "action_created_at",
    "repost"."user_id",
    "valid_posts"."owner_id",
    "valid_posts"."content",
    "valid_posts"."mentions",
    "valid_posts"."created_at",
    "valid_posts"."id",
    "valid_posts"."parent_id",
    "valid_posts"."deleted"
   FROM ("public"."repost"
     JOIN "public"."valid_posts" ON (("repost"."post_id" = "valid_posts"."id")))
UNION
 SELECT 'post'::"text" AS "type",
    "valid_posts"."created_at" AS "action_created_at",
    "valid_posts"."owner_id" AS "user_id",
    "valid_posts"."owner_id",
    "valid_posts"."content",
    "valid_posts"."mentions",
    "valid_posts"."created_at",
    "valid_posts"."id",
    "valid_posts"."parent_id",
    "valid_posts"."deleted"
   FROM "public"."valid_posts";

ALTER TABLE "public"."user_valid_posts" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_following_posts"() RETURNS SETOF "public"."user_valid_posts"
    LANGUAGE "sql"
    AS $$select * from user_valid_posts where (parent_id = 0 or type = 'repost') and (user_id = auth.uid() or user_id in (select following_id from follows where follower_id = auth.uid())) order by action_created_at desc;$$;

ALTER FUNCTION "public"."get_following_posts"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_parent_posts"("parent_id" bigint) RETURNS SETOF "public"."posts"
    LANGUAGE "plv8"
    AS $_$let parentId = parent_id;

while (parentId) {
  const post = plv8.execute(
      'select * from public.posts where id = $1',
      [parentId]
  )[0];
  plv8.return_next(post);
  parentId = post.parent_id;
}$_$;

ALTER FUNCTION "public"."get_parent_posts"("parent_id" bigint) OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "avatar" "text" DEFAULT ''::"text" NOT NULL,
    "bio" "text" DEFAULT ''::"text" NOT NULL,
    "banner" "text",
    "name" "text" NOT NULL,
    "username" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location" "text" DEFAULT ''::"text" NOT NULL,
    "website" "text" DEFAULT ''::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_top_users"("num" integer) RETURNS SETOF "public"."users"
    LANGUAGE "sql"
    AS $$select * from public.users where users.id != (SELECT auth.uid() AS uid) order by ( select count(owner_id) from public.posts where owner_id = users.id ) desc, created_at asc limit (num);$$;

ALTER FUNCTION "public"."get_top_users"("num" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_follow"() RETURNS "trigger"
    LANGUAGE "plv8" SECURITY DEFINER
    AS $_$plv8.execute(
      'insert into public.notifications (sender_id, recipient_id, type) values ($1, $2, $3) on conflict (sender_id, recipient_id, type, post_id) do update set read = false, created_at = now()',
      [NEW.follower_id, NEW.following_id, 'follow']
  );
return NEW;$_$;

ALTER FUNCTION "public"."handle_new_follow"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_like"() RETURNS "trigger"
    LANGUAGE "plv8" SECURITY DEFINER
    AS $_$const post = plv8.execute(
      'select * from public.posts where id = $1',
      [NEW.post_id]
  )[0];
if (NEW.user_id !== post.owner_id) {
  plv8.execute(
        'insert into public.notifications (sender_id, recipient_id, type, post_id) values ($1, $2, $3, $4) on conflict (sender_id, recipient_id, type, post_id) do update set read = false, created_at = now()',
        [NEW.user_id, post.owner_id, 'like', post.id]
    );
}
return NEW;$_$;

ALTER FUNCTION "public"."handle_new_like"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_reply"() RETURNS "trigger"
    LANGUAGE "plv8" SECURITY DEFINER
    AS $_$if (NEW.parent_id) {
  const parent = plv8.execute(
        'select * from public.posts where id = $1',
        [NEW.parent_id]
    )[0];
  if (NEW.owner_id !== parent.owner_id) {
    plv8.execute(
          'insert into public.notifications (sender_id, recipient_id, type, post_id) values ($1, $2, $3, $4)',
          [NEW.owner_id, parent.owner_id, 'reply', NEW.id]
      );
  }
}
return NEW;$_$;

ALTER FUNCTION "public"."handle_new_reply"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_repost"() RETURNS "trigger"
    LANGUAGE "plv8" SECURITY DEFINER
    AS $_$const post = plv8.execute(
      'select * from public.posts where id = $1',
      [NEW.post_id]
  )[0];
if (NEW.user_id !== post.owner_id) {
  plv8.execute(
        'insert into public.notifications (sender_id, recipient_id, type, post_id) values ($1, $2, $3, $4) on conflict (sender_id, recipient_id, type, post_id) do update set read = false, created_at = now()',
        [NEW.user_id, post.owner_id, 'repost', post.id]
    );
}
return NEW;$_$;

ALTER FUNCTION "public"."handle_new_repost"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plv8" SECURITY DEFINER
    AS $_$
  if (NEW.is_anonymous) {
    const project_id = plv8.execute(
      "select * from vault.decrypted_secrets where name = 'project_id'"
    )[0].decrypted_secret;
    const avatar_url = `https://${project_id}.supabase.co/storage/v1/object/public/profile_images/default.jpg`
    const username = 'anonymous' + Math.ceil(Math.random() * 100000);

    plv8.execute(
      "insert into public.users (id, name, username, avatar) values ($1, 'Anonymous', $2, $3)",
      [NEW.id, username, avatar_url]
    );
  } else {
    const full_name = NEW.raw_user_meta_data.full_name;
    const avatar_url = NEW.raw_user_meta_data.avatar_url;
    const username = full_name.split(' ')[0] + Math.ceil(Math.random() * 100000);

    plv8.execute(
      'insert into public.users (id, name, username, avatar) values ($1, $2, $3, $4)',
      [NEW.id, full_name, username, avatar_url]
    );
  }

  return NEW;
$_$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."bookmark" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL
);

ALTER TABLE "public"."bookmark" OWNER TO "postgres";

ALTER TABLE "public"."bookmark" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bookmarks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."follow" (
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" bigint NOT NULL
);

ALTER TABLE "public"."follow" OWNER TO "postgres";

ALTER TABLE "public"."follow" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."follows_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."like" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" bigint NOT NULL,
    "id" bigint NOT NULL
);

ALTER TABLE "public"."like" OWNER TO "postgres";

ALTER TABLE "public"."like" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "sender_id" "uuid",
    "recipient_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "post_id" bigint DEFAULT '0'::bigint NOT NULL
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."repost" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."repost_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."bookmark"
    ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."follow"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."like"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."repost"
    ADD CONSTRAINT "repost_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE UNIQUE INDEX "bookmarks_user_id_post_id_idx" ON "public"."bookmark" USING "btree" ("user_id", "post_id");

CREATE UNIQUE INDEX "follows_follower_id_following_id_idx" ON "public"."follow" USING "btree" ("follower_id", "following_id");

CREATE UNIQUE INDEX "likes_user_id_post_id_idx" ON "public"."like" USING "btree" ("user_id", "post_id");

CREATE UNIQUE INDEX "notifications_sender_id_recipient_id_type_post_id_idx" ON "public"."notifications" USING "btree" ("sender_id", "recipient_id", "type", "post_id");

CREATE OR REPLACE TRIGGER "after_follow_created" AFTER INSERT ON "public"."follow" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_follow"();

CREATE OR REPLACE TRIGGER "after_like_created" AFTER INSERT ON "public"."like" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_like"();

CREATE OR REPLACE TRIGGER "after_post_created" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_reply"();

CREATE OR REPLACE TRIGGER "after_repost_created" AFTER INSERT ON "public"."repost" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_repost"();

CREATE OR REPLACE TRIGGER "before_bookmark_create" BEFORE INSERT ON "public"."bookmark" FOR EACH ROW EXECUTE FUNCTION "public"."check_post_state"();

CREATE OR REPLACE TRIGGER "before_like_create" BEFORE INSERT ON "public"."like" FOR EACH ROW EXECUTE FUNCTION "public"."check_post_state"();

CREATE OR REPLACE TRIGGER "before_reply_create" BEFORE INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."check_parent_state"();

CREATE OR REPLACE TRIGGER "before_repost_create" BEFORE INSERT ON "public"."repost" FOR EACH ROW EXECUTE FUNCTION "public"."check_post_state"();

ALTER TABLE ONLY "public"."bookmark"
    ADD CONSTRAINT "bookmarks_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bookmark"
    ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."follow"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."follow"
    ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."like"
    ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."like"
    ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."repost"
    ADD CONSTRAINT "repost_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."repost"
    ADD CONSTRAINT "repost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

CREATE POLICY "Enable delete for users based on owner_id" ON "public"."posts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."bookmark" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."follow" FOR DELETE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "follower_id") OR (( SELECT "auth"."uid"() AS "uid") = "following_id")));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."like" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."repost" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on follower_id" ON "public"."follow" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "follower_id"));

CREATE POLICY "Enable insert for users based on owner_id" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."bookmark" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."like" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."repost" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for authenticated users" ON "public"."bookmark" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "public"."follow" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "public"."like" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "public"."posts" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "public"."repost" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read for users based on recipient_id" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "recipient_id"));

CREATE POLICY "Enable update for users based on id" ON "public"."users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Enable update for users based on recipient_id" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "recipient_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."posts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));

ALTER TABLE "public"."bookmark" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."follow" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."like" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."repost" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."check_parent_state"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_parent_state"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_parent_state"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_post_state"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_post_state"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_post_state"() TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON TABLE "public"."repost" TO "anon";
GRANT ALL ON TABLE "public"."repost" TO "authenticated";
GRANT ALL ON TABLE "public"."repost" TO "service_role";

GRANT ALL ON TABLE "public"."valid_posts" TO "anon";
GRANT ALL ON TABLE "public"."valid_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."valid_posts" TO "service_role";

GRANT ALL ON TABLE "public"."user_valid_posts" TO "anon";
GRANT ALL ON TABLE "public"."user_valid_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_valid_posts" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_following_posts"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_posts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_posts"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_parent_posts"("parent_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_parent_posts"("parent_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_parent_posts"("parent_id" bigint) TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_top_users"("num" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_users"("num" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_users"("num" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_follow"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_follow"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_follow"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_like"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_like"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_like"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_reply"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_reply"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_reply"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_repost"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_repost"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_repost"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON TABLE "public"."bookmark" TO "anon";
GRANT ALL ON TABLE "public"."bookmark" TO "authenticated";
GRANT ALL ON TABLE "public"."bookmark" TO "service_role";

GRANT ALL ON SEQUENCE "public"."bookmarks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bookmarks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bookmarks_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."follow" TO "anon";
GRANT ALL ON TABLE "public"."follow" TO "authenticated";
GRANT ALL ON TABLE "public"."follow" TO "service_role";

GRANT ALL ON SEQUENCE "public"."follows_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."follows_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."follows_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."like" TO "anon";
GRANT ALL ON TABLE "public"."like" TO "authenticated";
GRANT ALL ON TABLE "public"."like" TO "service_role";

GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."repost_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."repost_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."repost_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
