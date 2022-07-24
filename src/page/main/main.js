import User from "../../component/user/User";

const Main = () => {
    const userArray = [
        { id: 123, name: "jaemin", characterType: "man1" },
        { id: 124, name: "yejin", characterType: "man2" },
        { id: 125, name: "minjae", characterType: "man3" },
        { id: 126, name: "gahee", characterType: "man4" },
    ];
    return (
        <div>
            {userArray.map((item, index) => {
                return <User id={item.id} name={item.name} characterType={item.characterType} />;
            })}
        </div>
    );
};

export default Main;
