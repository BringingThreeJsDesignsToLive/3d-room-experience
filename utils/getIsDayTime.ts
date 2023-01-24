const getIsDayTime = () => new Date().getHours() >= 19 ? false : true;
export default getIsDayTime;