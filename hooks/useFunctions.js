import { httpsCallable } from 'firebase/functions';

import { functions } from '../firebase.js';

const useFunctions = () => {
  const callFunction = async (name, data = {}) => {
    try {
      const func = httpsCallable(functions, name);
      const result = await func(data);
      return result.data;
    } catch (err) {
      console.error(err);
    }
  };

  return { callFunction };
};

export default useFunctions;
