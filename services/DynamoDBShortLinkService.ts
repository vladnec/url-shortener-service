import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ShortLink } from '../interfaces/ShortLink';

class DynamoDBShortLinkService {
    protected docClient = new AWS.DynamoDB.DocumentClient();

    protected table = String(process.env.SHORT_URL_TABLE);

    public async store(item: ShortLink): Promise<void> {
        const params: DocumentClient.PutItemInput = {
            Item: item,
            TableName: this.table,
        };
        try {
            await this.docClient.put(params).promise();
            return Promise.resolve();
        } catch (err) {
            return Promise.reject('Error saving to DB');
        }
    }

    public async getShortLinkById(id: string): Promise<ShortLink | null> {
        const params: DocumentClient.GetItemInput = {
            Key: {
                id,
            },
            TableName: this.table,
        };
        console.log('Performing get operation with params', JSON.stringify(params));
        try {
            const response = await this.docClient.get(params).promise();
            if (!response || !response.Item) {
                return null;
            }
            console.log(response);
            return response.Item as ShortLink;
        } catch (err) {
            return Promise.reject(err);
        }
    }
}
export default DynamoDBShortLinkService;
