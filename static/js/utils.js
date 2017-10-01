/**
 * Simplify I/O calls from the api.
 */
const api = {
  ls: (url) => {
    return new Promise((resolve, error) => {
      qwest.get('/api/ls/' + url)
          .then((xhr, data) => resolve(JSON.parse(data)))
          .catch(error);
    });
  },
  upload: (data) => {
    return new Promise((resolve, error) => {
      qwest.post('/api/upload', data)
          .then((xhr, data) => resolve(JSON.parse(data)))
          .catch(error);
    });
  },
};

/**
 * Determine wether we can use advanced upload procedure.
 * @return {Boolean} True if advanced options are available.
 */
function isAdvancedUploadSupported() {
  let div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) &&
      'FormData' in window && 'FileReader' in window;
}

/**
 * Generates a unique id.
 * @return {String} a unique id.
 */
function generateGUUID() {
  const s4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
      s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() +
      s4());
}
