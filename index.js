const automl = require('@google-cloud/automl');
const client = new automl.v1beta1.PredictionServiceClient({
    projectId: 'automl-219316',
    keyFilename: './AutoML-73494da3f841.json',
});

module.exports = (text, callback) => {
    const formattedName = client.modelPath('automl-219316', 'us-central1', 'TCN5675256607392472835');
    const payload = {};
    payload.textSnippet = { "content": text, "mime_type": "text/plain" };
    const request = {
        name: formattedName,
        payload: payload,
    };

    client.predict(request)
        .then(responses => {
            const response = responses[0].payload[0].displayName;
            callback(null, response);
        })
        .catch(err => {
            console.error(err);
            callback(err, null)
        });
}