export const queryRemover = queryParams => {
  if (Object.keys(queryParams) === 0) return queryParams;
  let queryString = {};
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] !== '') {
      queryString = { ...queryString, [key]: queryParams[key] };
    }
  });
  return { ...queryString };
};
