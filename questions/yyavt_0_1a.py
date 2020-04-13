from YAVT import QuestionSet

q = QuestionSet()

q.name("yyavt-0.1a")
q.model("yyavt-8-axes")

q.core_version("0.1")
q.disable_shuffle(True)
q.disable_back(True)
q.disable_quiz_no(True)

q.add_question(
    text = "民族间有优劣之分，这显而易见",
    effect = [0, 0, 0, -5, 0, 0, 0, 0],
    offset = [0, 0, 0, -5,  0, 0, 0, 0],
    posflag = ["种族主义"],
)

q.add_question(
    text = "我的民族是优秀的民族，大部分其他民族都不如她",
    effect = [0, 0, 0, 0, 0, 0, 0, -10],
    posflag = ["种族优越"],
    exclude = ["种族劣势"],
    require = ["种族主义"]
)

q.add_question(
    text = "我的民族生来较其他民族劣等，真是可耻",
    effect = [0, 0, 0, 0, 0, 0, 0, 10],
    posflag = ["种族劣势"],
    exclude = ["种族优越"],
    require = ["种族主义"]
)

q.add_question(
    text = "让黑鬼进入我们的国家，玷污我国的人民，这简直就是在犯罪",
    effect = [0, 0, 5, -5, 0, 0, 0, 10],
    offset = [0, 0, 5, -5, 0, 0, 0, 10],
    posflag = ["种族主义"],
)

q.add_question(
    text = "时机一到，那些谩骂侮辱过我国的国民都会受到惩罚",
    effect = [0, 0, 5, 0, 0, 0, 0, 5],
    offset = [0, 0, -5, 0, 0, 0, 0, 0],
)

q.add_question(
    text = "中医神奇的精髓是其作为理论依据的阴阳五行理论"，
    effect = [0, 5, 0, 0, 0, 0, 0, 0]
)

q.add_question(
    text = "非我族类，其心必异",
    effect = [0, 0, 0, -5, 0, 0, 0, -10],
    offset = [0, 0, 0, 0, 0, 0, 0, -10]
)

q.add_question(
    text = "要保证一个国家的正常运转，没有一个强而有力的政府是万万不行的",
    effect = []
)
