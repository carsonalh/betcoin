import axios from './axios-instance';

export default user =>
    axios
        .post('/users', { user })
        .then(res => res.data.user)
        .catch(err => {
            if (err.response) {
                throw err.response.data;
            } else {
                throw { error: 'Error signing up!' };
            }
        });
