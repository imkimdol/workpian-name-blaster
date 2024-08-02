
const replaceNames = () => {
    const html = document.body.innerHTML;

    const regex = />\w*\s\w*\s\(\d{8}\)</g;
    const replacement = html.replace(regex, (s) => {
        var newString = s.replace(/[a-zA-Z]+/g, "xxxxx");
        return newString;
    });

    document.body.innerHTML = replacement;
};

setTimeout(replaceNames, 3000);