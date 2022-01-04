import memoize from './memoize';

const request = memoize((val: string) => fetch(val).then(data => data.json()))
export default request;
