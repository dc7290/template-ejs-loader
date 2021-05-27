module.exports = {
  about: {
    url: (hash: string = '') => ({
      pathName: `/about${hash ? `#${hash}` : ''}`,
    }),
  },
}
