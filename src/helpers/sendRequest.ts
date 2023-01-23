import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendRequest = async (url: string, { arg }: any) => {
  try {
    const res = await axios.post(url, {
      ...arg,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
export default sendRequest;
