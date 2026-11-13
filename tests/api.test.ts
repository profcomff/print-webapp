import { test } from 'node:test';
import assert from 'node:assert/strict';
import axios, { AxiosError } from 'axios';
import { uploadFile, printQr, errorMessage } from '../src/api/printer.ts';

test('upload reserves PIN then sends multipart PDF with progress; QR sends unique file pins', async () => {
  const calls: {url: string; data: unknown}[] = [];
  axios.defaults.adapter = async config => {
    calls.push({url: config.url || '', data: config.data});
    return {data: config.url?.endsWith('/qr') ? {status:'ok'} : {pin:'AB12'}, status:200, statusText:'OK', headers:{}, config};
  };
  const file = new File(['%PDF-1.7'], 'notes.pdf');
  assert.equal(await uploadFile({surname:' Иванов ',number:' 123 ',file,copies:1,pages:''}, () => {}), 'AB12');
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/file$/);
  assert.equal(JSON.parse(calls[0].data as string).surname, 'Иванов');
  assert.match(calls[1].url, /\/file\/AB12$/);
  assert.equal((calls[1].data as FormData).get('file'), file);
  await printQr('token', ['AB12','AB12']);
  assert.deepEqual(JSON.parse(calls[2].data as string), {qr_token:'token',files:['AB12']});
});
test('failed reservation does not upload and failed QR is not treated as success', async () => {
  let calls=0;
  axios.defaults.adapter = async config => {
    calls++;
    throw new AxiosError('forbidden', 'ERR_BAD_REQUEST', config, {}, {data:{detail:'User error'}, status:403, statusText:'Forbidden', headers:{},config});
  };
  await assert.rejects(uploadFile({surname:'Иванов',number:'123',file:new File(['%PDF-'], 'n.pdf'),copies:1,pages:''}, () => {}));
  assert.equal(calls, 1);
  axios.defaults.adapter = async config => ({data:{status:'error',detail:'Terminal not found by qr'},status:200,statusText:'OK',headers:{},config});
  await assert.rejects(printQr('bad', ['AB12']), /QR/);
  calls=0;
  await assert.rejects(printQr('token', []));
});
test('network and server validation errors have actionable messages', () => {
  assert.match(errorMessage(new Error('network')), /соединени/);
  for (const [status, text] of [[403,/фамилию/],[413,/размер|страниц/],[415,/PDF/],[416,/страниц/],[422,/параметры/]] as const) {
    assert.match(errorMessage({isAxiosError:true,response:{status}}), text);
  }
});
