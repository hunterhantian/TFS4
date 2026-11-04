import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceText} from '../web/modules/source-text.mjs';

test('paper formatting remains readable and highlights text without breaking source tags',()=>{
 assert.equal(sourceText('21. Ce garçon est prêt à <mark><u>[monter]</u></mark> un projet.'),'21. Ce garçon est prêt à <mark><u>[monter]</u></mark> un projet.');
 assert.equal(sourceText('Avez-vous \\_\\_\\_ argent ?'),'Avez-vous ___ argent ?');
 assert.equal(sourceText('La <u>suite</u> du texte','suite'),'La <u><mark>suite</mark></u> du texte');
 assert.equal(sourceText('un <u>été</u> chaud','ete chaud'),'un <u><mark>été</mark></u><mark> chaud</mark>');
 assert.equal(sourceText('XX<sup>e</sup> siècle'),'XX<sup>e</sup> siècle');
 assert.equal(sourceText('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
});
