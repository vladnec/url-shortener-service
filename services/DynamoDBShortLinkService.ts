import AWS from 'aws-sdk';
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {ShortLink} from "../interfaces/ShortLink";

class DynamoDBShortLinkService {
    protected docClient = new AWS.DynamoDB.DocumentClient();
    protected table: string = String(process.env.SHORT_URL_TABLE);

    public async store(item: ShortLink): Promise<void> {
        const params: DocumentClient.PutItemInput = {
            Item: item,
            TableName: this.table,
        }

        return this.docClient.put(params)
            .promise()
            .then(() => {
                console.log('Item saved successfully')
            })
            .catch((err: Error) => {
                console.error('Error saving to DB', err)
            })
    }
}
export default DynamoDBShortLinkService
