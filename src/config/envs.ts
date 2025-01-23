import 'dotenv/config';
import * as joi from 'joi';

interface Envvars{
    PORT: number;
    DATABASE_URL: string;
    NATS_SERVERS: string[];
    
}

const envsSchema = joi.object({

    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items( joi.string()).required(),
})
.unknown(true);

const {error, value} = envsSchema.validate({
    ... process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if( error ) {
    throw new Error(`Config validation error: ${ error.message }`);

}

const envVars: Envvars = value;

export const envs = {
    port: envVars.PORT,
    dataBaseUrl: envVars.DATABASE_URL,
    natsServer: envVars.NATS_SERVERS,
}