export const PAGE_SIZE = 10;

export const getPagination = (page: number) => {
    const from = page ? page * PAGE_SIZE : 0
    const to = page ? from + PAGE_SIZE - 1 : PAGE_SIZE - 1
  
    return { from, to }
  }
