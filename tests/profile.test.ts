import { test } from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import { profileSession, loadPrintProfile } from "../src/api/profile.ts";

test("profile autofill requires delegated personal and credentials scopes", () => {
  assert.equal(
    profileSession("?token=secret&user_id=42&scopes=userdata.info.admin"),
    null,
  );
  assert.equal(
    profileSession(
      "?token=secret&user_id=bad&scopes=userdata.category.personal.read,userdata.category.credentials.read",
    ),
    null,
  );
  assert.deepEqual(
    profileSession(
      "?token=secret&user_id=42&scopes=userdata.category.personal.read,userdata.category.credentials.read",
    ),
    { token: "secret", userId: 42 },
  );
});
test("profile uses delegated authorization only for userdata and returns editable identity", async () => {
  axios.defaults.adapter = async (config) => {
    assert.match(config.url || "", /\/userdata\/user\/42$/);
    assert.equal(config.headers.Authorization, "secret");
    return {
      data: {
        items: [
          {
            category: "Личная информация",
            param: "Полное имя",
            value: "Иванов Иван Иванович",
          },
          {
            category: "Учетные данные",
            param: "Номер профсоюзного билета",
            value: "001234",
          },
        ],
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  process.env.VUE_APP_API_PRINTER = "https://api.test.profcomff.com/print";
  assert.deepEqual(await loadPrintProfile({ token: "secret", userId: 42 }), {
    surname: "Иванов",
    number: "001234",
  });
});
test("missing profile fields remain absent for manual input", async () => {
  axios.defaults.adapter = async (config) => ({
    data: {
      items: [
        {
          category: "Личная информация",
          param: "Полное имя",
          value: "Иванов Иван",
        },
      ],
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });
  assert.deepEqual(await loadPrintProfile({ token: "secret", userId: 42 }), {
    surname: "Иванов",
  });
});
test("partial delegated profile fills available fields independently", async () => {
  assert.deepEqual(
    profileSession(
      "?token=secret&user_id=42&scopes=userdata.category.personal.read",
    ),
    { token: "secret", userId: 42 },
  );
  axios.defaults.adapter = async (config) => ({
    data: {
      items: [
        {
          category: "Личная информация",
          param: "Полное имя",
          value: "Иванов Иван",
        },
      ],
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });
  assert.deepEqual(await loadPrintProfile({ token: "secret", userId: 42 }), {
    surname: "Иванов",
  });
});
