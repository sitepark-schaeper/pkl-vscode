/*
 * Copyright © 2024-2025 Apple Inc. and the Pkl project authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { workspace } from "vscode";
import {
  LanguageClient,
  RequestType,
  ConfigurationParams,
} from "vscode-languageclient/node";
import {
  CONFIG_CLI_PATH,
  CONFIG_JAVA_PATH,
  CONFIG_LSP_DEBUG_PORT,
  CONFIG_LSP_PATH,
  CONFIG_LSP_SOCKET_HOST,
  CONFIG_LSP_SOCKET_PORT,
  CONFIG_MODULEPATH,
} from "./consts";

const getConfig = <T>(configName: string): T | undefined => {
  const value = workspace.getConfiguration().get<T>(configName);
  if (value === "" || value === null) {
    return undefined;
  }
  return value;
};

const config = {
  get javaPath() {
    return getConfig<string>(CONFIG_JAVA_PATH);
  },

  get lspPath() {
    return getConfig<string>(CONFIG_LSP_PATH);
  },

  get cliPath() {
    return getConfig<string>(CONFIG_CLI_PATH);
  },

  get modulepath() {
    return getConfig<string[]>(CONFIG_MODULEPATH) ?? [];
  },

  get lspDebugPort() {
    return getConfig<number>(CONFIG_LSP_DEBUG_PORT);
  },

  get lspSocketPort() {
    return getConfig<number>(CONFIG_LSP_SOCKET_PORT);
  },

  get lspSocketHost() {
    return getConfig<string>(CONFIG_LSP_SOCKET_HOST);
  },
};

export default config;

export const configurationRequestHandlerType = new RequestType<
  ConfigurationParams,
  any[],
  void
>('workspace/configuration');

export const configurationRequestHandler = async (
  params: ConfigurationParams
): Promise<any[]> => {
  return params.items.map(item => {
    switch (item.section) {
      case 'pkl.cli.path':
        return config.cliPath;
      case 'pkl.modulepath':
        return config.modulepath.map(entry => vscode.Uri.parse(entry).fsPath);
      default:
        return null;
    }
  })
};

export async function registerConfigurationRequestHandlers(client: LanguageClient) {
  client.onRequest(configurationRequestHandlerType, configurationRequestHandler);
}
