import AWS from 'aws-sdk';

class SecretsManagerService {
    private readonly region: string = process.env.region!;

    private secretsManager: AWS.SecretsManager = new AWS.SecretsManager({
        region: this.region,
    });

    public async getSecret(secretName: string): Promise<string | null> {
        const params: AWS.SecretsManager.GetSecretValueRequest = {
            SecretId: secretName,
        };
        try {
            const secretValue = await this.secretsManager.getSecretValue(params).promise();
            return Promise.resolve(secretValue.SecretString ? JSON.parse(secretValue.SecretString)[secretName] : null);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}
export default SecretsManagerService;
