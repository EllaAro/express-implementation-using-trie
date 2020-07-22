class TrieNode {
  constructor(key) {
    // the "key" value will be a section in the path
    this.key = key;

    // we have a hash of children (next-in-line section in the path)
    this.children = {};

    // a special node is a node that starts with ":"
    this.isSpecial = false;

    // check to see if the node is at the end, if it is we set the leaf as the handler function
    this.handler = null;
  }
}

class ExpressTrie {
  constructor() {
    this.root = new TrieNode(null);
  }

  insert(path, handler) {
    let node = this.root;

    // for every section in the path
    for (let i = 1; i < path.length; i++) {
      // check to see if section node exists in children.
      if (!node.children[path[i]]) {
        // if it doesn't exist, we then create it.
        node.children[path[i]] = new TrieNode(path[i]);

        // if it's a dynamic path section, we want to save it as a special node
        if (path[i].charAt(0) === ":") node.children[path[i]].isSpecial = true;
      }
      // proceed to the next depth in the trie.
      node = node.children[path[i]];

      // finally, we check to see if it's the last section.
      if (i == path.length - 1) {
        // if it is, we set the handler of the node (leaf) to the given handler
        node.handler = handler;
      }
    }
  }

  runHandler(path) {
    let node = this.root,
      specialNode;
    const requestParams = {};

    //  for every section in the path
    for (let i = 1; i < path.length; i++) {
      // check to see if section node exists in children.
      if (node.children[path[i]]) {
        // if it exists, proceed to the next depth of the trie.
        node = node.children[path[i]];
      }
      //check if its a special node
      else if (
        Object.keys(node.children).filter(
          (key) => node.children[key].isSpecial === true
        ).length > 0
      ) {
        let specialNode = Object.keys(node.children).filter(
          (key) => node.children[key].isSpecial === true
        )[0];
        requestParams[specialNode.substring(1)] = path[i];
        node = node.children[specialNode];
      } else {
        // doesn't exist, return false since it's not a valid path.
        return false;
      }
    }

    // we finished going through all the path, a handler will returned if we actually passed a whole valid path
    return node.handler(requestParams);
  }
}

class ExpressApp {
  constructor() {
    this.expressTrie = new ExpressTrie();
  }

  use(route, handler) {
    this.expressTrie.insert(this.parseUrl(route), handler);
  }

  handle(url) {
    const parsedUrl = this.parseUrl(url.split("#")[1]);

    return this.expressTrie.runHandler(parsedUrl);
  }

  parseUrl(url) {
    return url.split("/");
  }
}

const proxy = new ExpressApp();

// proxy.use('/apps/profile/person/:recordId/:test', handleProfilePage);
proxy.use("/apps/profile/company/:recordId", handleCompanyPage);
// proxy.use('/resetPassword', handleResetPassword);

// // proxy.handle('https://app.zoominfo.com/#/apps/profile/person/1645938489?a=b');
proxy.handle("https://app.zoominfo.com/#/apps/profile/company/1645938489?a=b");

// // proxy.handle('https://app.zoominfo.com/#/resetPassword?a=b&id=123');

// function handleProfilePage (request)
// {
//     console.log('handleProfilePage:' + JSON.stringify(request));

// }

function handleCompanyPage(request) {
  console.log("handleCompanyPage:" + JSON.stringify(request));
}

// function handleResetPassword (request)
// {
//     console.log('handleResetPassword:'+ JSON.stringify(request));
// }
