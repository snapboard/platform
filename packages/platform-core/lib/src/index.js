import axios from 'axios';
import Handlebars from 'handlebars';
import { get, isFunction, mapValues, isString, isArray, isPlainObject, map, merge, forEach } from 'lodash';
import pkg from '../package.json';
const PROJECT_ID = process.env.GCLOUD_PROJECT ?? process.env.PROJECT_ID ?? 'snapboard-prod';
export async function handler(req, res, app, version) {
    const { path, bundle } = req.body;
    const start = Date.now();
    const logger = createLogger('NOTICE', app, version, req);
    const requester = createRequestFn(app, logger);
    logger('platform__handler_start');
    try {
        const fn = get(app, path);
        if (!isFunction(fn) && fn?.url === undefined) {
            throw new Error('Path is not a fn');
        }
        const result = isFunction(fn)
            ? await fn(createSnap(requester, logger), bundle)
            : await callRequestObject(requester, fn, bundle);
        res.status(200).send(result);
        logger('platform__handler_end', {
            duration: Date.now() - start
        });
    }
    catch (err) {
        res.status(500).send({
            error: {
                code: err?.code,
                reason: err?.reason,
                message: err?.message
            }
        });
        const errorLogger = createLogger('ERROR', app, version, req);
        errorLogger('platform__handler_end', {
            duration: Date.now() - start
        });
    }
}
export async function callRequestObject(requester, config, data = {}) {
    const { transformResponse, ...otherConfig } = config;
    const mappedConfig = handlebarsValue(otherConfig, data);
    // Transform object values
    const resp = await requester(mappedConfig);
    if (!transformResponse)
        return resp;
    // TODO: perform transform
    return resp;
}
export function createRequestFn(app, logger) {
    // Generate the before processors
    const befores = app.before;
    const beforeConfig = {};
    if (befores) {
        forEach(befores, (beforeFn) => {
            merge(beforeConfig, beforeFn(beforeConfig));
        });
    }
    return async function createRequestFn(requestConfig) {
        logger('platform__request', { request: requestConfig });
        const { data, body, ...rest } = requestConfig;
        const res = await axios(merge({}, beforeConfig, {
            data: data || body,
            ...rest
        }));
        logger('platform__request_response', { request: requestConfig, response: res });
        return res;
    };
}
export function createLogger(severity, app, version, req) {
    const globalLogFields = {};
    if (typeof req !== 'undefined') {
        const traceHeader = req.header('X-Cloud-Trace-Context');
        if (traceHeader && PROJECT_ID) {
            const [trace] = traceHeader.split('/');
            globalLogFields['logging.googleapis.com/trace'] = `projects/${PROJECT_ID}/traces/${trace}`;
        }
    }
    return function logger(message, ...params) {
        const entry = {
            severity,
            message,
            params,
            appId: app?.id,
            version,
            platformVersion: pkg.version,
            ...globalLogFields
        };
        console.log(entry);
    };
}
export function createSnap(requester, logger) {
    return {
        log: logger,
        request: requester
    };
}
export function handlebarsValue(value, data) {
    if (isPlainObject(value))
        return mapValues(value, handlebarsValue);
    if (isArray(value))
        return map(value, handlebarsValue);
    if (isString(value))
        return Handlebars.compile(value)(data);
    return value;
}
