import MockAdapter from "axios-mock-adapter";
import { mockInstance } from "../commons/ajax";
import simplify from "./simplify";
// TODO 配置mock 统一返回头
const mock = new MockAdapter(mockInstance);

simplify(mock, [require("./mock-users").default]);
