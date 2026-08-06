```javascript
import axios from 'axios';

const getRates = async () => {
  return axios.get('/api/currency/latest');
};

export default {
  getRates,
};
```