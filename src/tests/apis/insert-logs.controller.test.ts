import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import {app} from '../../index.js';

describe('app: POST /logs', () => {
  test('Should return HTTP 200', async () => {
    const payload = {
        logs:[
        {
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'user-service',
            message: 'Integration test log entry'
        }
    ]};
    const response = await request(app)
      .post('/logs')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.accepted).toBe(1);
    expect(response.body.rejected).toHaveLength(0);

  });
    test('Should return HTTP 200 when there is at least one valid entry', async () => {
    const payload = {
        logs:[
        {
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'user-service',
            message: 'Integration test log entry'
        },
        // invalid
        {
            timestamp: "2026-07-20T14:32:01.123",
            level: 'info',
            service: 'payment-service',
            message: 'Payment success',
            attributes:{
                user_id : "42",
                region: "eu-west",
            }
        },
    ]};
    const response = await request(app)
      .post('/logs')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).toBe(200);
    console.log(response.body);
    expect(response.body.accepted).toBe(1);
    expect(response.body.rejected).toHaveLength(1);
  });
  test('Should return HTTP 400 when all entries are rejected', async () => {
    const payload = {
        logs:[
        {
            timestamp: "2020:12:1",
            level: 'info',
            service: 'user-service',
            message: 'Integration test log entry'
        }
    ]};
    const response = await request(app)
      .post('/logs')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.accepted).toBe(0);
    expect(response.body.rejected).toHaveLength(1);

  });  
  test('Should return HTTP 400 when malformed JSON is sent', async () => {
    const response = await request(app)
      .post('/logs')
      .set('Content-Type', 'application/json')
      .send('{ "invalid_json": ')

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("The request body contains malformed JSON");
  });


});