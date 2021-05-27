module.exports = {
  about: {
    url: function (hash) {
      if (hash === void 0) {
        hash = ''
      }
      return {
        pathName: '/about' + (hash ? '#' + hash : ''),
      }
    },
  },
}
