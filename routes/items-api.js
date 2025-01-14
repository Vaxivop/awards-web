const apiApp = require('polka')();
const sequelize = require('../models').sequelize;
const {Op} = require('sequelize');

// Sequelize models to avoid redundancy
const Items = sequelize.model('items');

const {yuuko} = require('../bot/index');
const config = require('../config');

apiApp.post('/add', async (request, response) => {
	const auth = await request.authenticate({level: 2});
	if (!auth) {
		return response.json(401, {error: 'You must be an host to modify items'});
	}

	let items;
	try {
		items = await request.json();
	} catch (error) {
		response.error(error);
	}
	try {
		const promiseArr = new Array();

		promiseArr.push(new Promise(async (resolve, reject) => {
			try {
				await Items.bulkCreate(items);
				resolve();
			} catch (error) {
				// response.error(error);
				reject(error);
			}
		}));

		Promise.all(promiseArr).then(async ()=>{
			response.empty();
		});
	} catch (error) {
		response.error(error);
	}
});


apiApp.post('/update/parents', async (request, response) => {
	const auth = await request.authenticate({level: 2});
	if (!auth) {
		return response.json(401, {error: 'You must be an host to modify items'});
	}

	let data;
	try {
		data = await request.json();
	} catch (error) {
		response.error(error);
	}
	try {
		if (data.old && data.new){
			await Items.update({parentID: data.new}, {where: {parentID: data.old}});
			response.json(await Items.findAll());
		} else {
			response.error("Invalid Fields.");
		}
	} catch (error) {
		response.error(error);
	}
});

apiApp.post('/update', async (request, response) => {
	const auth = await request.authenticate({level: 2});
	if (!auth) {
		return response.json(401, {error: 'You must be an host to modify items'});
	}

	let item;
	try {
		item = await request.json();
	} catch (error) {
		response.error(error);
	}
	try {
		await Items.update(item, {where: {id: item.id}});
		response.empty();
		// response.json(await Items.findAll());
	} catch (error) {
		response.error(error);
	}
});

apiApp.post('/update/bulk', async (request, response) => {
	const auth = await request.authenticate({level: 2});
	if (!auth) {
		return response.json(401, {error: 'You must be an host to modify items'});
	}

	let items;
	try {
		items = await request.json();
	} catch (error) {
		response.error(error);
	}
	try {
		const promiseArr = new Array();

		for (const item of items){
			promiseArr.push(new Promise(async (resolve, reject) => {
				try {
					// console.log(item.id);
					await Items.update(item, {where: {id: item.id}});
					resolve();
				} catch (error) {
					// response.error(error);
					reject(error);
				}
			}));
		}
		Promise.all(promiseArr).then(async ()=>{
			response.empty();
		});
	} catch (error) {
		response.error(error);
	}
});


apiApp.get('/', async (request, response) => {
	try {
		response.json(await Items.findAll({include: [{
				model: Items,
				as: 'parent',
				where: {
					type: 'anime',
				},
				include: [
					{
						model: Items,
						as: 'parent',
						where: {
							type: 'char',
						},
					},
				],
			},],
		}));
	} catch (error) {
		response.error(error);
	}
});

apiApp.get('/page/:page', async (request, response) => {
	try {
		const page = request.params.page;
		const offset = 1000*page;
		
		response.json(await Items.findAndCountAll({
			include: [{
				model: Items,
				as: 'parent',
				include: [
					{
						model: Items,
						as: 'parent',
					},
				],
			},],
			offset: offset,
			limit: 1000,
		}));
	} catch (error) {
		response.error(error);
	}
});

apiApp.delete('/delete/imported/char', async (request, response) => {
	const auth = await request.authenticate({level: 2});
	if (!auth) {
		return response.json(401, {error: 'You must be an host to delete items'});
	}
	try {
		await Items.destroy({where: {
			anilistID: {
				[Op.ne]: -1,
			},
			type: {
				[Op.or]: ['va', 'char'],
			}
		}});
		response.json(await Items.findAll());
	} catch (error) {
		response.error(error);
	}
});

apiApp.delete('/delete/imported', async (request, response) => {
	const auth = await request.authenticate({level: 2});
	if (!auth) {
		return response.json(401, {error: 'You must be an host to delete items'});
	}
	try {
		await Items.destroy({where: {
			anilistID: {
				[Op.ne]: -1,
			}
		}});
		response.json(await Items.findAll());
	} catch (error) {
		response.error(error);
	}
});

apiApp.delete('/delete', async (request, response) => {
	const auth = await request.authenticate({level: 2});
	if (!auth) {
		return response.json(401, {error: 'You must be an host to delete items'});
	}
	let item;
	try {
		item = Number(await request.json());
	} catch (error) {
		response.error(error);
	}
	try {
		await Items.destroy({where: {
			id: item,
		}});
		response.json(await Items.findAll());
	} catch (error) {
		response.error(error);
	}
});

module.exports = apiApp;
