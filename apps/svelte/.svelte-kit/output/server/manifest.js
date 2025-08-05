export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["assets/mocks/weather-data.json","assets/styles/base.css","assets/styles/components.css","assets/styles/design-system.css","assets/styles/variables.css","favicon.png"]),
	mimeTypes: {".json":"application/json",".css":"text/css",".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.axhaIJzU.js",app:"_app/immutable/entry/app.o_9fpbgR.js",imports:["_app/immutable/entry/start.axhaIJzU.js","_app/immutable/chunks/Dd9LS7G8.js","_app/immutable/chunks/D-X4wTf0.js","_app/immutable/chunks/BoBpZ2Lh.js","_app/immutable/entry/app.o_9fpbgR.js","_app/immutable/chunks/D-X4wTf0.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
