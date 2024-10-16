export default async ({req, res, log, error}) => {
    log('Hello there');
    error('Hello there, I am error');
    return res.send('Hello 200!');
};