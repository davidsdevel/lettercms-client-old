const {createReadStream} = require('fs');
const {join} = require('path');
const IBMCOS = require('ibm-cos-sdk');

var CONFIG = {
  useHmac: false,
  bucketName: 'davidsdevel-storage-cos-standard-y2b',
  serviceCredential: JSON.parse(process.env.COS_CREDENTIALS),
};


const getS3 = async (endpoint, serviceCredential) => {
  let s3Options;

  if (serviceCredential.apikey) {
    s3Options = {
      apiKeyId: serviceCredential.apikey,
      serviceInstanceId: serviceCredential.resource_instance_id,
      region: 'ibm',
      endpoint: new IBMCOS.Endpoint(endpoint),
    };
  } else {
    throw new Error('IAM ApiKey required to create S3 Client');
  }

  console.info(' S3 Options Used: \n', s3Options);
  console.debug('\n\n ================== \n\n');
  return new IBMCOS.S3(s3Options);
};

const putObjects = async (s3, bucketName) => {
  const isProd = process.env.ENV === 'production';
  const {version} = require('./package.json');

  await s3.putObject({
    Bucket: bucketName,
    Key: isProd ? 'davidsdevel-latest.tgz' : 'davidsdevel-staging.tgz',
    Body: createReadStream(join(__dirname, 'master.tgz')),
  }).promise();

  if (isProd) {
    await s3.putObject({
      Bucket: bucketName,
      Key: 'davidsdevel-'+version+'.tgz',
      Body: createReadStream(join(__dirname, 'master.tgz')),
    }).promise();
  }

  console.info(' Uploaded');
  return Promise.resolve();
};


const defaultEndpoint = 's3.us-south.cloud-object-storage.appdomain.cloud';

console.info('\n ======== Config: ========= ');
console.info('\n ', CONFIG);

const upload = async () => {
  try {
    const { serviceCredential } = CONFIG;
    const { bucketName } = CONFIG;

    let s3 = await getS3(defaultEndpoint, serviceCredential);

    await putObjects(s3, bucketName);

    console.info('\n\n ============= script completed ============ \n\n');
  } catch (err) {
    console.error('Found an error in S3 operations');
    console.error('statusCode: ', err.statusCode);
    console.error('message: ', err.message);
    console.error('stack: ', err.stack);
    process.exit(1);
  }
};

upload();
