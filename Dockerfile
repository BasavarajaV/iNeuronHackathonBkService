FROM ubuntu:20.04

WORKDIR /usr/src/ineuron-bk-service

# Bundle app source
COPY dist/ineuron-bk-service .

EXPOSE 8000

ENTRYPOINT [ "./ineuron-bk-service" ]
