import dotenv from 'dotenv';
dotenv.config();
import { exec } from 'child_process';

const command = `db2dbml mysql 'mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}' -o database.dbml`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error executing command: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`⚠️ Stderr: ${stderr}`);
        return;
    }
    console.log(`✅ Command output:\n${stdout}`);
});
