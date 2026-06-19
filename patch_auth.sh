#!/bin/bash
sed -i "s/declare module \"@auth\/core\/jwt\"/declare module \"next-auth\/jwt\"/g" src/auth.ts
