const User = (props) => {
    /*
        TODO : 캐릭터 움직임 구현하기
    */
    return (
        <div>
            <div>{props.name}</div>
            <div>{props.characterType}</div>
        </div>
    );
};

export default User;
