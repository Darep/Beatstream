FROM ruby:2.2.5

ENV BUNDLE_PATH /bundle
ENV BUNDLE_BIN /bundle/bin:${BUNDLE_BIN}
ENV GEM_HOME /bundle
ENV PATH ${BUNDLE_BIN}:${PATH}

# Install node
ENV NVM_DIR /root/.nvm
ENV NVM_VERSION v0.39.4
ENV NODE_VERSION 4.9.1
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash \
  && . ~/.nvm/nvm.sh \
  && nvm install ${NODE_VERSION} \
  && nvm alias default ${NODE_VERSION} \
  && nvm use default
ENV NODE_PATH ${NVM_DIR}/versions/node/v${NODE_VERSION}/lib/node_modules
ENV PATH ${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:${PATH}

WORKDIR /var/app
