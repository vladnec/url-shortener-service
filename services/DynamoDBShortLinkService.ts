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
        try {
            const response = await this.docClient.get(params).promise();
            if (!response || !response.Item) {
                return null;
            }
            return response.Item as ShortLink;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async getShortLinkByURL(url: string): Promise<ShortLink | null> {
        const params: DocumentClient.QueryInput = {
            TableName: this.table,
            IndexName: 'url_index',
            KeyConditionExpression: '#url = :url',
            ExpressionAttributeNames: {
                '#url': 'url',
            },
            ExpressionAttributeValues: {
                ':url': url,
            },
        };
        try {
            const response = await this.docClient.query(params).promise();
            if (!response || !response.Items || !response.Items[0]) {
                return null;
            }
            return response.Items[0] as ShortLink;
        } catch (err) {
            return Promise.reject(err);
        }
    }
}
export default DynamoDBShortLinkService;
