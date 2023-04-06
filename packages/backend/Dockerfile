FROM ubuntu:jammy

WORKDIR /app
COPY . .
RUN apt-get update -qq \
  && apt-get install -y -qq \
  jq \
  apt-transport-https \
  ca-certificates \
  curl \
  software-properties-common \
  dnsutils \
  && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - \
  && add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu jammy stable" \
  && apt-get update -qq \
  && apt-get install -y -qq \
  docker-ce \
  bc \
  && apt-get -qq clean \
  && apt-get autoremove -y \
  && rm -rf \
  /var/lib/apt/lists/* \
  /tmp/* \
  /var/tmp/*

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION v16.17.0
RUN mkdir -p /usr/local/nvm && apt-get update && echo "y" | apt-get install curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"
ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/bin
ENV PATH $NODE_PATH:$PATH

CMD [ "npm", "start" ]