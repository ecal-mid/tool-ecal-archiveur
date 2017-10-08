/**
 * Simplify I/O calls from the api.
 */
const api = {
  upload: (data) => {
    return new Promise((resolve, error) => {
      qwest.post('/api/upload', data)
          .then((xhr, data) => resolve(JSON.parse(data)))
          .catch(error);
    });
  },
  update: (year, assignmentId, data) => {
    return new Promise((resolve, error) => {
      qwest.post(`/api/a/${year}/${assignmentId}`, data, {dataType: 'json'})
          .then((xhr, resp) => resolve(JSON.parse(resp)))
          .catch(error);
    });
  },
  notify: (type, data) => {
    return new Promise((resolve, error) => {
      qwest.post(`/api/notify/${type}`, data, {dataType: 'json'})
          .then((xhr, resp) => resolve(JSON.parse(resp)))
          .catch(error);
    });
  },
};
