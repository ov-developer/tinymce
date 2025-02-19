/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import ScriptLoader from './dom/ScriptLoader';

interface Resource {
  load: <T = any>(id: string, url: string) => Promise<T>;
  add: (id: string, data: any) => void;
  unload: (id: string) => void;
}

const awaiter = (resolveCb: (data: any) => void, rejectCb: (err?: any) => void, timeout = 1000) => {
  let done = false;
  let timer = null;
  const complete = <T extends any[]>(completer: (...args: T) => void) => (...args: T) => {
    if (!done) {
      done = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      completer.apply(null, args);
    }
  };
  const resolve = complete(resolveCb);
  const reject = complete(rejectCb);
  const start = (...args: Parameters<typeof reject>) => {
    if (!done && timer === null) {
      timer = setTimeout(() => reject.apply(null, args), timeout);
    }
  };
  return {
    start,
    resolve,
    reject
  };
};

const create = (): Resource => {
  const tasks: Record<string, Promise<any>> = {};
  const resultFns: Record<string, (data: any) => void> = {};

  const load = <T>(id: string, url: string): Promise<T> => {
    const loadErrMsg = `Script at URL "${url}" failed to load`;
    const runErrMsg = `Script at URL "${url}" did not call \`tinymce.Resource.add('${id}', data)\` within 1 second`;
    if (tasks[id] !== undefined) {
      return tasks[id];
    } else {
      const task = new Promise<any>((resolve, reject) => {
        const waiter = awaiter(resolve, reject);
        resultFns[id] = waiter.resolve;
        ScriptLoader.ScriptLoader.loadScript(url).then(() => waiter.start(runErrMsg), () => waiter.reject(loadErrMsg));
      });
      tasks[id] = task;
      return task;
    }
  };

  const add = (id: string, data: any) => {
    if (resultFns[id] !== undefined) {
      resultFns[id](data);
      delete resultFns[id];
    }
    tasks[id] = Promise.resolve(data);
  };

  const unload = (id: string) => {
    delete tasks[id];
  };

  return {
    load,
    add,
    unload
  };
};

const Resource = create();

export default Resource;
