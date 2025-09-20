"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
var axios_1 = require("axios");
/**
 * AI Service Module with streaming and tool calling support
 */
var AIService = /** @class */ (function () {
    function AIService(config) {
        if (config === void 0) { config = {}; }
        this.apiKey = config.apiKey || process.env.FRIENDLI_API_KEY || 'flp_IOXWZmimNdkT2PaZv2MbJXrsMZ4ITqzCJu98viZEHXt0ec';
        this.model = config.model || 'deptumkw5lakgbo';
        this.baseURL = 'https://api.friendli.ai/dedicated/v1';
        this.client = axios_1.default.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(this.apiKey)
            },
            timeout: 30000
        });
    }
    /**
     * Send a message to the AI with streaming and tool calling support
     */
    AIService.prototype.sendMessage = function (message_1) {
        return __awaiter(this, arguments, void 0, function (message, conversationHistory, tools, options) {
            var messages, requestBody, response, error_1;
            var _a, _b;
            if (conversationHistory === void 0) { conversationHistory = []; }
            if (tools === void 0) { tools = []; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        messages = __spreadArray(__spreadArray([], conversationHistory, true), [
                            {
                                role: 'user',
                                content: message
                            }
                        ], false);
                        requestBody = __assign({ model: this.model, messages: messages, max_tokens: options.maxTokens || 16384, temperature: options.temperature || 0.6, top_p: options.topP || 0.95, stream: options.stream || false }, options);
                        // Add tools if provided
                        if (tools && tools.length > 0) {
                            requestBody.tools = tools;
                        }
                        // Add stream_options if streaming is enabled
                        if (requestBody.stream) {
                            requestBody.stream_options = {
                                include_usage: true
                            };
                        }
                        return [4 /*yield*/, this.client.post('/chat/completions', requestBody)];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: response.data,
                                usage: response.data.usage || null
                            }];
                    case 2:
                        error_1 = _c.sent();
                        console.error('AI Service Error:', error_1.message);
                        return [2 /*return*/, {
                                success: false,
                                error: ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message,
                                statusCode: ((_b = error_1.response) === null || _b === void 0 ? void 0 : _b.status) || 500
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AIService;
}());
exports.AIService = AIService;
// Export default instance
exports.aiService = new AIService();
