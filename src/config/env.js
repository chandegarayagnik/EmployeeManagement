import dotenv from 'dotenv'
dotenv.config()

export const env = {
    PORT: process.env.PORT,
    DB_SERVER: process.env.DB_SERVER,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_DIALECT: process.env.DB_DIALECT,
    ENVIROMENT: process.env.ENVIROMENT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
}