package io.tolgee.fixtures

import io.tolgee.development.DbPopulatorReal
import io.tolgee.model.Project
import io.tolgee.model.UserAccount
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.web.servlet.ResultActions


abstract class ProjectAuthRequestPerformer(
        userAccount: UserAccount,
        val projectUrlPrefix: String = "/api/project/"
) : SignedInRequestPerformer() {

    @field:Autowired
    lateinit var dbPopulator: DbPopulatorReal

    val project: Project by lazy {
        projectSupplier?.invoke()
                ?: dbPopulator.createBase(generateUniqueString(), username = userAccount.username!!)
    }

    var projectSupplier: (() -> Project)? = null

    abstract fun performProjectAuthPut(url: String, content: Any?): ResultActions
    abstract fun performProjectAuthPost(url: String, content: Any?): ResultActions
    abstract fun performProjectAuthGet(url: String): ResultActions
    abstract fun performProjectAuthDelete(url: String, content: Any?): ResultActions
}
