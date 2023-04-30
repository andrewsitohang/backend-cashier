import user from '../models/user.js';
import { faker } from '@faker-js/faker';

const run = async (limit) => {
    try{
        var data = [];
        for (let i = 0; i < limit; i++) {
            data.push({
                fullname: faker.name.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            })
        }
        const fakeData = await user.insertMany(data);

        if(fakeData){
            console.log(fakeData)
            console.log('Total data : ' + fakeData.length)

            process.exit()
        }
    } catch (error) {
        console.log(error)
        process.exit()
    }
}

export { run };