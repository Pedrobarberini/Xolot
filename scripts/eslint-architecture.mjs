import { dirname, resolve } from "node:path";

function normalize(value) {
  return value.replaceAll("\\", "/");
}
function featureOf(file) {
  return normalize(file).match(/\/src\/features\/([^/]+)(?:\/|$)/)?.[1];
}
const forbiddenSdk = /^(?:react(?:-native)?(?:\/|$)|firebase(?:-admin)?(?:\/|$)|@aws-sdk\/)/;

export default {
  rules: {
    boundaries: {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          domainSdk: "Domínio não pode importar React ou SDK externo: {{source}}.",
          uiSdk: "Interface deve usar o contrato do módulo, não o SDK: {{source}}.",
          crossFeature: "Import profundo de outro módulo não é permitido: {{source}}.",
          sharedFeature: "shared não pode depender de uma funcionalidade: {{source}}.",
          domainLayer: "Domínio não pode depender de apresentação ou infraestrutura: {{source}}.",
        },
      },
      create(context) {
        const file = normalize(context.filename);
        const origin = featureOf(file);
        function check(node) {
          const source = node.source?.value;
          if (typeof source !== "string") return;
          const target = source.startsWith(".")
            ? normalize(resolve(dirname(file), source))
            : source;
          const targetFeature = featureOf(target);
          let messageId;
          if (/\/src\/shared\//.test(file) && targetFeature) messageId = "sharedFeature";
          else if (/\/domain\//.test(file) && forbiddenSdk.test(source)) messageId = "domainSdk";
          else if (
            /\/features\/[^/]+\/ui\//.test(file) &&
            /^(?:firebase(?:-admin)?(?:\/|$)|@aws-sdk\/)/.test(source)
          )
            messageId = "uiSdk";
          else if (
            origin &&
            targetFeature &&
            origin !== targetFeature &&
            !new RegExp(`/features/${targetFeature}(?:/index(?:\\.[cm]?[jt]sx?)?)?$`).test(target)
          )
            messageId = "crossFeature";
          else if (/\/domain\//.test(file) && /\/(?:ui|data|bootstrap|platform)\//.test(target))
            messageId = "domainLayer";
          if (messageId) context.report({ node, messageId, data: { source } });
        }
        return {
          ImportDeclaration: check,
          ExportNamedDeclaration: check,
          ExportAllDeclaration: check,
        };
      },
    },
  },
};
