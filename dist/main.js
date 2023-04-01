"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core_1 = require("@actions/core");
var axios_1 = require("axios");
var oidcWarning = 'GitHub Actions did not inject $ACTIONS_ID_TOKEN_REQUEST_TOKEN or ' +
    '$ACTIONS_ID_TOKEN_REQUEST_URL into this job. This most likely means the ' +
    'GitHub Actions workflow permissions are incorrect, or this job is being ' +
    'run from a fork. For more information, please see https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var proxy, assumeGroup, audience, oidcTokenRequestToken, oidcTokenRequestURL, token, oidcClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    proxy = (0, core_1.getInput)('proxy', { required: true });
                    assumeGroup = (0, core_1.getInput)('assumeGroup', { required: true });
                    audience = (0, core_1.getInput)('audience');
                    (0, core_1.debug)("Using workload identity provider \"".concat(proxy, "\""));
                    oidcTokenRequestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
                    oidcTokenRequestURL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
                    if (!oidcTokenRequestToken || !oidcTokenRequestURL) {
                        throw new Error(oidcWarning);
                    }
                    return [4 /*yield*/, (0, core_1.getIDToken)(audience)];
                case 1:
                    token = _a.sent();
                    if (!token) {
                        (0, core_1.warning)(oidcWarning);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, axios_1["default"].create({
                            baseURL: proxy,
                            headers: {
                                Authorization: "Bearer ".concat(token),
                                UserAgent: 'github-actions-workload-identity'
                            }
                        })];
                case 2:
                    oidcClient = _a.sent();
                    return [4 /*yield*/, oidcClient
                            .post('/prod/openid-connect', {
                            assumeGroup: assumeGroup
                        })
                            .then(function (response) {
                            var data = response.data;
                            (0, core_1.info)("Successfully generated token for ".concat(data.name));
                            (0, core_1.setSecret)(data.value);
                            (0, core_1.setOutput)('api_key', data.value);
                            (0, core_1.setOutput)('api_key_expiration', data.expires_on);
                            (0, core_1.setOutput)('api_key_id', data.id);
                        })["catch"](function (error) {
                            throw new Error("Failed to generate token: ".concat(error));
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main()["catch"](function (error) {
    (0, core_1.setFailed)("waigel/cf-oidc-proxy-action failed with: ".concat(error));
});
