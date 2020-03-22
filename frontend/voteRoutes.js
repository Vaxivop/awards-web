/* eslint-disable */

import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import NotFound from './pages/NotFound';

import Voting from './pages/Voting';
import GroupDisplay from './voting/GroupDisplay';
import Instructions from './voting/Instructions';

export default new VueRouter({
	mode: 'history',
	scrollBehavior(to, from, savedPosition) {
		document.body.scrollTop = 0; // For Safari
    	document.documentElement.scrollTop = 0;
	},
	routes: [
		// keep this here for now
		// Stuff for nomination things
		{
			path: '/vote',
			component: Voting,
			redirect: '/vote/main',
			children: [
				{
					path: ':group',
					component: GroupDisplay,
					name: 'GroupDisplay',
					props: true,
				},
				{
					path: 'instructions',
					component: Instructions,
					name: 'Instructions',
				},
			],
		},

		// 404 route - keep last
		{path: '*', component: NotFound},
	],
});