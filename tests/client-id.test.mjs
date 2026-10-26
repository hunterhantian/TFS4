import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {newClientId} from '../web/modules/client-id.mjs';
test('client UUID generation works without secure-context randomUUID',()=>{const provider={getRandomValues:webcrypto.getRandomValues.bind(webcrypto)};const first=newClientId(provider),second=newClientId(provider);assert.match(first,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);assert.notEqual(first,second);});
