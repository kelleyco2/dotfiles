opts = {
	create_keymaps = false,
	display_snippet = false,
	print_tag = "DEBUG",
}

require("debugprint").setup(opts)

vim.keymap.set("n", "<Leader>lo", function()
	-- Note: setting `expr=true` and returning the value are essential
	return require("debugprint").debugprint()
end, {
	expr = true,
})

vim.keymap.set("n", "<Leader>Lo", function()
	-- Note: setting `expr=true` and returning the value are essential
	return require("debugprint").debugprint({ above = true })
end, {
	expr = true,
})

vim.keymap.set("n", "<Leader>lv", function()
	-- Note: setting `expr=true` and returning the value are essential
	return require("debugprint").debugprint({ variable = true })
end, {
	expr = true,
})

vim.keymap.set("n", "<Leader>Lv", function()
	-- Note: setting `expr=true` and returning the value are essential
	return require("debugprint").debugprint({ above = true, variable = true })
end, {
	expr = true,
})

-- vim.api.nvim_create_user_command("DeleteDebugs", function(opts)
-- 	-- Note: you must set `range=true` and pass through opts for ranges to work
-- 	M.deleteprints(opts)
-- end, {
-- 	range = true,
-- })

vim.keymap.set("n", "<Leader>kl", "<CMD>DeleteDebugPrints<CR>")
