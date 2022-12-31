import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CorsHttpMethod, HttpApi, HttpMethod} from '@aws-cdk/aws-apigatewayv2-alpha';
import {HttpLambdaIntegration} from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from 'path'
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";

export interface EventIncStackProps extends StackProps {
    hostedZoneName: string
    allowOrigins: string[];
}

export class EventIncStack extends Stack {
    private shortLinkTable: Table
    private registerShortLink: NodejsFunction
    private resolveShortLink: NodejsFunction
    constructor(scope: Construct, id: string, props: EventIncStackProps) {
        super(scope, id, props);

        this.createShortLinkTable()
        this.createResolveShortLinkLambda()
        this.createRegisterShortLinkLambda()
        this.createApi(props);
    }
    private createShortLinkTable() {
        this.shortLinkTable = new Table(this, `ShortURLTable`, {
            tableName: `ShortURLTable`,
            partitionKey: {name: 'id', type: AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST
        })
    }
    private createApi(props: EventIncStackProps) {
        // const hostedZone = new PublicHostedZone(this, 'HostedZone', {
        //     zoneName: props.hostedZoneName
        // });
        //
        // const certificate = new DnsValidatedCertificate(this, 'DnsValidatedCertificate', {
        //     hostedZone: hostedZone,
        //     domainName: `api-v2.${props.hostedZoneName}`
        // })
        //
        // const domainName = new DomainName(this, 'ApiDomainName', {
        //     domainName: `api-v2.${props.hostedZoneName}`,
        //     certificate: certificate
        // })

        const api = new HttpApi(this, `URlShortenerHttpApi`, {
            // defaultDomainMapping: { domainName },
            corsPreflight: {
                allowHeaders: ['Authorization'],
                allowMethods: [CorsHttpMethod.OPTIONS, CorsHttpMethod.GET, CorsHttpMethod.POST],
                allowOrigins: props.allowOrigins,
                allowCredentials: false,
                maxAge: Duration.minutes(15)
            }
        })

        api.addRoutes({
            path: '/short-link',
            methods: [HttpMethod.POST],
            integration: new HttpLambdaIntegration('registerShortLink', this.registerShortLink)
        })

        api.addRoutes({
            path: '/:id',
            methods: [HttpMethod.GET],
            integration: new HttpLambdaIntegration('resolveShortLink', this.resolveShortLink)
        })

        // new ARecord(this, 'ApiGatewayRecordSet', {
        //     target: RecordTarget.fromAlias(new ApiGatewayv2DomainProperties(domainName.regionalDomainName, domainName.regionalHostedZoneId)),
        //     zone: hostedZone,
        //     recordName: 'api-v2'
        // })
    }
    private createRegisterShortLinkLambda() {
        this.registerShortLink = this.createLambda(
            'registerShortLink',
            '/registerShortLink.ts',
            {
                'SHORT_URL_TABLE': this.shortLinkTable.tableName,
            }
        )
        this.shortLinkTable.grantWriteData(this.registerShortLink)
    }
    private createResolveShortLinkLambda() {
        this.resolveShortLink = this.createLambda(
            'resolveShortLink',
            '/resolveShortLink.ts',
            {
                'SHORT_URL_TABLE': this.shortLinkTable.tableName,
            }
        )
        this.shortLinkTable.grantReadData(this.resolveShortLink)
    }
    private createLambda(name: string, handlerPath: string, environment: object = {}, props: NodejsFunctionProps = {}): NodejsFunction {
        return new NodejsFunction(this, name, {
            entry: path.join('__dirname', '../functions', handlerPath),
            runtime: Runtime.NODEJS_18_X,
            memorySize:  props.memorySize ?? 128,
            environment: {
                ...environment
            }
        })
    }
}
