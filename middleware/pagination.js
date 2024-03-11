const pagination = (result, page, limit) => {
  const totalRecord = result?.length;
  const totalPage = Math.ceil(totalRecord / limit);
  const start = page <= totalPage ? (page - 1) * limit : null;
  const end = page <= totalPage ? page * limit : null;

  const data = result.slice(start, end);

  return {
    data: data,
    pagination: {
      page: page > totalPage ? totalPage : page,
      total_page: totalPage,
      total_record: totalRecord,
      limit: limit,
    },
  };
};

module.exports = pagination;
