const getIsDayTime = () => new Date().getHours() >= 19 ? false : true;
// const getIsDayTime = () => true
export default getIsDayTime;