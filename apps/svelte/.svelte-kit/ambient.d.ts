
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const TMUX_CONF: string;
	export const PYTHONIOENCODING: string;
	export const USER: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const npm_config_user_agent: string;
	export const XINITRC: string;
	export const GIT_EDITOR: string;
	export const npm_node_execpath: string;
	export const BROWSER: string;
	export const WT_PROFILE_ID: string;
	export const SHLVL: string;
	export const XDG_CACHE_HOME: string;
	export const npm_config_noproxy: string;
	export const HOME: string;
	export const OLDPWD: string;
	export const VIPSHOME: string;
	export const NVM_BIN: string;
	export const npm_package_json: string;
	export const NVM_INC: string;
	export const PAGER: string;
	export const XSERVERRC: string;
	export const hr: string;
	export const npm_config_userconfig: string;
	export const npm_config_local_prefix: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const PIP_CONFIG_FILE: string;
	export const P9K_TTY: string;
	export const WSL_DISTRO_NAME: string;
	export const COLOR: string;
	export const WAYLAND_DISPLAY: string;
	export const FORCE_COLOR: string;
	export const LOGNAME: string;
	export const PULSE_SERVER: string;
	export const WSL_INTEROP: string;
	export const NAME: string;
	export const _P9K_SSH_TTY: string;
	export const _: string;
	export const npm_config_prefix: string;
	export const npm_config_npm_version: string;
	export const TERM: string;
	export const OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
	export const npm_config_cache: string;
	export const DEBUG_COLORS: string;
	export const CURL_HOME: string;
	export const WGETRC: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const LESSHISTFILE: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const XDG_RUNTIME_DIR: string;
	export const WT_SESSION: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const DISPLAY: string;
	export const DENO_INSTALL: string;
	export const LANG: string;
	export const OPENSSL_DIR: string;
	export const XDG_CONFIG_HOME: string;
	export const XDG_DATA_HOME: string;
	export const LS_COLORS: string;
	export const npm_lifecycle_script: string;
	export const PASSWORD_STORE_DIR: string;
	export const SHELL: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const ZLIB: string;
	export const CLAUDECODE: string;
	export const P9K_SSH: string;
	export const KDEHOME: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const PWD: string;
	export const DOCKER_CONFIG: string;
	export const PIP_LOG_FILE: string;
	export const LC_ALL: string;
	export const npm_execpath: string;
	export const CARGO_HOME: string;
	export const ZDOTDIR: string;
	export const PYENV_ROOT: string;
	export const _P9K_TTY: string;
	export const NVM_CD_FLAGS: string;
	export const npm_config_global_prefix: string;
	export const npm_command: string;
	export const XDG_LIB_HOME: string;
	export const TMUX_PLUGIN_MANAGER_PATH: string;
	export const HOSTTYPE: string;
	export const WSL2_GUI_APPS_ENABLED: string;
	export const TERMINAL: string;
	export const WSLENV: string;
	export const XDG_BIN_HOME: string;
	export const EDITOR: string;
	export const ADOTDIR: string;
	export const INIT_CWD: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		TMUX_CONF: string;
		PYTHONIOENCODING: string;
		USER: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		npm_config_user_agent: string;
		XINITRC: string;
		GIT_EDITOR: string;
		npm_node_execpath: string;
		BROWSER: string;
		WT_PROFILE_ID: string;
		SHLVL: string;
		XDG_CACHE_HOME: string;
		npm_config_noproxy: string;
		HOME: string;
		OLDPWD: string;
		VIPSHOME: string;
		NVM_BIN: string;
		npm_package_json: string;
		NVM_INC: string;
		PAGER: string;
		XSERVERRC: string;
		hr: string;
		npm_config_userconfig: string;
		npm_config_local_prefix: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		PIP_CONFIG_FILE: string;
		P9K_TTY: string;
		WSL_DISTRO_NAME: string;
		COLOR: string;
		WAYLAND_DISPLAY: string;
		FORCE_COLOR: string;
		LOGNAME: string;
		PULSE_SERVER: string;
		WSL_INTEROP: string;
		NAME: string;
		_P9K_SSH_TTY: string;
		_: string;
		npm_config_prefix: string;
		npm_config_npm_version: string;
		TERM: string;
		OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
		npm_config_cache: string;
		DEBUG_COLORS: string;
		CURL_HOME: string;
		WGETRC: string;
		npm_config_node_gyp: string;
		PATH: string;
		LESSHISTFILE: string;
		NODE: string;
		npm_package_name: string;
		XDG_RUNTIME_DIR: string;
		WT_SESSION: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		DISPLAY: string;
		DENO_INSTALL: string;
		LANG: string;
		OPENSSL_DIR: string;
		XDG_CONFIG_HOME: string;
		XDG_DATA_HOME: string;
		LS_COLORS: string;
		npm_lifecycle_script: string;
		PASSWORD_STORE_DIR: string;
		SHELL: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		ZLIB: string;
		CLAUDECODE: string;
		P9K_SSH: string;
		KDEHOME: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		PWD: string;
		DOCKER_CONFIG: string;
		PIP_LOG_FILE: string;
		LC_ALL: string;
		npm_execpath: string;
		CARGO_HOME: string;
		ZDOTDIR: string;
		PYENV_ROOT: string;
		_P9K_TTY: string;
		NVM_CD_FLAGS: string;
		npm_config_global_prefix: string;
		npm_command: string;
		XDG_LIB_HOME: string;
		TMUX_PLUGIN_MANAGER_PATH: string;
		HOSTTYPE: string;
		WSL2_GUI_APPS_ENABLED: string;
		TERMINAL: string;
		WSLENV: string;
		XDG_BIN_HOME: string;
		EDITOR: string;
		ADOTDIR: string;
		INIT_CWD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
